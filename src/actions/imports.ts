"use server";

import { prisma } from "@/lib/prisma";
import { ImportEntity, ImportStatus } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as xlsx from "xlsx";
import Papa from "papaparse";
import { pusherServer } from "@/lib/pusher";

// --- File Storage Utility ---

async function saveTempFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = path.join(process.cwd(), ".tempmediaStorage");
  await mkdir(uploadDir, { recursive: true });
  
  const ext = file.name.split('.').pop() || 'csv';
  const fileName = `import_${uuidv4()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);
  
  await writeFile(filePath, buffer);
  return filePath;
}

// --- Action: Create Import Job ---

export async function getImportJobStatus(jobId: string) {
  const job = await prisma.importJob.findUnique({
    where: { id: jobId }
  });
  if (!job) throw new Error("Job not found");
  return { 
    status: job.status,
    successCount: job.successCount,
    errorCount: job.errorCount,
  };
}

export async function createImportJob(festivalId: string, entity: ImportEntity, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Save to temporary storage
  const filePath = await saveTempFile(file);

  // Create Job in DB
  const job = await prisma.importJob.create({
    data: {
      festivalId,
      entity,
      status: ImportStatus.PENDING,
      fileUrl: filePath,
    }
  });

  // Launch background worker without awaiting it
  // This allows the server action to return immediately while parsing happens in the background.
  processImportJob(job.id, festivalId).catch(err => {
    console.error(`Import Job ${job.id} failed globally:`, err);
  });

  return job.id;
}

// --- Background Worker: Process Import Job ---

const BATCH_SIZE = 500;

async function processImportJob(jobId: string, festivalId: string) {
  try {
    // 1. Mark as processing
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportStatus.PROCESSING }
    });

    const job = await prisma.importJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    // 2. Parse File
    const filePath = job.fileUrl;
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    let rows: any[] = [];
    
    if (ext === 'csv') {
      // For CSV, PapaParse can read from file stream, but we'll read to memory for simplicity unless it's huge
      // Actually, standard memory parsing is fine up to ~10-50k rows in Node
      const fs = require('fs');
      const csvData = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      rows = parsed.data;
    } else {
      // XLSX
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = xlsx.utils.sheet_to_json(sheet);
    }

    // 3. Hand off to specific entity processor
    // We update total rows now
    await prisma.importJob.update({
      where: { id: jobId },
      data: { totalRows: rows.length }
    });

    let successCount = 0;
    let errorCount = 0;
    let errors: any[] = [];

    // Dispatch to entity processor
    const result = await dispatchEntityImport(jobId, festivalId, job.entity, rows);
    successCount = result.successCount;
    errorCount = result.errorCount;
    errors = result.errors;

    // 4. Mark as completed
    await prisma.importJob.update({
      where: { id: jobId },
      data: { 
        status: ImportStatus.COMPLETED,
        successCount,
        errorCount,
        errors: errors.length > 0 ? JSON.stringify(errors) : "[]"
      }
    });

    // Notify Pusher that it's completely done
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-completed', { jobId, successCount, errorCount });
    }

  } catch (error: any) {
    console.error(`Import Job ${jobId} failed:`, error);
    await prisma.importJob.update({
      where: { id: jobId },
      data: { 
        status: ImportStatus.FAILED,
        errors: JSON.stringify([{ row: -1, field: 'global', issue: error.message }])
      }
    });
  }
}

// --- Entity Dispatcher ---

async function dispatchEntityImport(jobId: string, festivalId: string, entity: ImportEntity, rows: any[]) {
  // We will build these implementations next
  if (entity === 'PROGRAMME') {
     return await importProgrammes(jobId, festivalId, rows);
  } else if (entity === 'CANDIDATE') {
     return await importCandidates(jobId, festivalId, rows);
  } else if (entity === 'VENDOR') {
     return await importVendors(jobId, festivalId, rows);
  } else if (entity === 'STAFF') {
     return await importStaff(jobId, festivalId, rows);
  } else if (entity === 'REGISTRATION') {
     return await importRegistrations(jobId, festivalId, rows);
  }
  
  return { successCount: 0, errorCount: rows.length, errors: [{ row: -1, field: 'global', issue: 'Entity not supported' }] };
}

// Stubs for entity functions
async function importProgrammes(jobId: string, festivalId: string, rows: any[]) {
  const categories = await prisma.category.findMany({ where: { festivalId } });
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c.id]));

  const existingCodes = await prisma.programme.findMany({
    where: { festivalId },
    select: { code: true }
  });
  const codeSet = new Set(existingCodes.map(p => p.code.toLowerCase().trim()));

  const stages = await prisma.stage.findMany({ where: { festivalId } });
  const stageMap = new Map(stages.map(s => [s.name.toLowerCase().trim(), s.id]));

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  // Track new codes being inserted within this batch to prevent duplicates inside the file
  const newlyAddedCodes = new Set<string>();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validRowsToInsert: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNum = i + j + 2; // Assuming 1-indexed row with header
      
      const name = row.Name || row.name;
      const code = row.Code || row.code;
      const categoryName = row.Category || row.category;
      const type = (row.Type || row.type || "INDIVIDUAL").toUpperCase();
      const judgmentMethodStr = (row.JudgmentMethod || row['Judgment Method'] || row.judgmentMethod || "MANUAL_SCORE").toUpperCase().replace(/\s+/g, '_');
      const venueName = row.Venue || row.venue;
      
      if (!name || !code || !categoryName) {
        errors.push({ row: rowNum, field: "global", issue: "Name, Code, and Category are required" });
        errorCount++;
        continue;
      }

      const categoryId = categoryMap.get(String(categoryName).toLowerCase().trim());
      if (!categoryId) {
        errors.push({ row: rowNum, field: "category", issue: `Category '${categoryName}' not found` });
        errorCount++;
        continue;
      }

      const codeLower = String(code).toLowerCase().trim();
      if (codeSet.has(codeLower) || newlyAddedCodes.has(codeLower)) {
        errors.push({ row: rowNum, field: "code", issue: `Programme Code '${code}' already exists` });
        errorCount++;
        continue;
      }

      if (!['MANUAL_SCORE', 'POSITION_ONLY', 'GRADE_ONLY'].includes(judgmentMethodStr)) {
        errors.push({ row: rowNum, field: "judgmentMethod", issue: `Invalid Judgment Method: ${judgmentMethodStr}` });
        errorCount++;
        continue;
      }
      
      if (!['INDIVIDUAL', 'GROUP'].includes(type)) {
        errors.push({ row: rowNum, field: "type", issue: `Invalid Type: ${type}` });
        errorCount++;
        continue;
      }

      let venueId = null;
      if (venueName) {
        venueId = stageMap.get(String(venueName).toLowerCase().trim());
        if (!venueId) {
          errors.push({ row: rowNum, field: "venue", issue: `Venue '${venueName}' not found` });
          errorCount++;
          continue;
        }
      }

      newlyAddedCodes.add(codeLower);
      validRowsToInsert.push({
        festivalId,
        name: String(name),
        code: String(code),
        categoryId,
        type,
        judgmentMethod: judgmentMethodStr,
        venueId,
        status: "draft"
      });
    }

    if (validRowsToInsert.length > 0) {
      const res = await prisma.programme.createMany({
        data: validRowsToInsert,
        skipDuplicates: true
      });
      successCount += res.count;
    }
    
    // Fire progress update per batch
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-progress', { jobId, successCount, errorCount, batchProcessed: true });
    }
  }

  return { successCount, errorCount, errors };
}
async function importCandidates(jobId: string, festivalId: string, rows: any[]) {
  const categories = await prisma.category.findMany({ where: { festivalId } });
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c.id]));

  const teams = await prisma.team.findMany({ where: { festivalId } });
  const teamMap = new Map(teams.map(t => [t.name.toLowerCase().trim(), t.id]));

  const existingChestNumbers = await prisma.candidate.findMany({
    where: { festivalId },
    select: { chestNumber: true }
  });
  const chestNumberSet = new Set(existingChestNumbers.map(c => c.chestNumber?.toLowerCase().trim()).filter(Boolean));

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  const newlyAddedChestNumbers = new Set<string>();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validRowsToInsert: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNum = i + j + 2;
      
      const name = row.Name || row.name || row.NAME;
      const chestNumber = String(row.ChestNumber || row['Chest Number'] || row.chestNumber || row['CEST.NO'] || row['CHEST.NO'] || row.CHESTNO || row["CHEST .NO"] || row["CHEST\n.NO"] || row["CHEST\r\n.NO"] || "").trim();
      const categoryName = row.Category || row.category || row.CATEGATY || row.CATEGOTY || row.CATEGORY;
      const teamName = row.Team || row.team || row.TEAM;
      const gender = row.Gender || row.gender || row.GENDER;
      
      if (!name || !categoryName) {
        errors.push({ row: rowNum, field: "global", issue: "Name and Category are required" });
        errorCount++;
        continue;
      }

      const categoryId = categoryMap.get(String(categoryName).toLowerCase().trim());
      if (!categoryId) {
        errors.push({ row: rowNum, field: "category", issue: `Category '${categoryName}' not found` });
        errorCount++;
        continue;
      }

      let teamId = null;
      if (teamName) {
        teamId = teamMap.get(String(teamName).toLowerCase().trim());
        if (!teamId) {
          errors.push({ row: rowNum, field: "team", issue: `Team '${teamName}' not found` });
          errorCount++;
          continue;
        }
      }

      if (chestNumber) {
        const cnLower = chestNumber.toLowerCase();
        if (chestNumberSet.has(cnLower) || newlyAddedChestNumbers.has(cnLower)) {
          errors.push({ row: rowNum, field: "chestNumber", issue: `Chest Number '${chestNumber}' is already taken` });
          errorCount++;
          continue;
        }
        newlyAddedChestNumbers.add(cnLower);
      }

      validRowsToInsert.push({
        festivalId,
        name: String(name),
        chestNumber: chestNumber || null,
        categoryId,
        teamId,
        gender: gender ? String(gender) : null
      });
    }

    if (validRowsToInsert.length > 0) {
      const res = await prisma.candidate.createMany({
        data: validRowsToInsert,
        skipDuplicates: true
      });
      successCount += res.count;
    }
    
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-progress', { jobId, successCount, errorCount, batchProcessed: true });
    }
  }

  return { successCount, errorCount, errors };
}
async function importVendors(jobId: string, festivalId: string, rows: any[]) {
  // Pre-fetch users associated with this festival to map emails to userIds
  // Actually, users are global, so we can just look up by email from the rows.
  // To avoid querying thousands of times, let's extract all emails first.
  const emailsToLookup = new Set<string>();
  rows.forEach(r => {
    const email = r.Email || r.email;
    if (email) emailsToLookup.add(String(email).toLowerCase().trim());
  });

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: Array.from(emailsToLookup) } },
    select: { id: true, email: true }
  });
  const userMap = new Map(existingUsers.map(u => [u.email, u.id]));

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validRowsToInsert: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNum = i + j + 2;
      
      const email = String(row.Email || row.email || "").toLowerCase().trim();
      const name = row.Name || row.name;
      const description = row.Description || row.description || "";
      const categoryStr = String(row.Category || row.category || "OTHER").toUpperCase();
      const statusStr = String(row.Status || row.status || "APPROVED").toUpperCase();
      const boothNumber = row.BoothNumber || row['Booth Number'] || row.boothNumber;
      
      if (!email || !name) {
        errors.push({ row: rowNum, field: "global", issue: "Email and Name are required" });
        errorCount++;
        continue;
      }

      const userId = userMap.get(email);
      if (!userId) {
        errors.push({ row: rowNum, field: "email", issue: `User with email '${email}' not found. They must sign up first.` });
        errorCount++;
        continue;
      }

      if (!['FOOD', 'MERCH', 'BEVERAGE', 'EXPERIENCE', 'OTHER'].includes(categoryStr)) {
        errors.push({ row: rowNum, field: "category", issue: `Invalid Category: ${categoryStr}` });
        errorCount++;
        continue;
      }

      if (!['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'].includes(statusStr)) {
        errors.push({ row: rowNum, field: "status", issue: `Invalid Status: ${statusStr}` });
        errorCount++;
        continue;
      }

      validRowsToInsert.push({
        festivalId,
        userId,
        name: String(name),
        description: String(description),
        category: categoryStr as any,
        status: statusStr as any,
        boothNumber: boothNumber ? String(boothNumber) : null
      });
    }

    if (validRowsToInsert.length > 0) {
      const res = await prisma.vendor.createMany({
        data: validRowsToInsert,
        skipDuplicates: true
      });
      successCount += res.count;
    }
    
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-progress', { jobId, successCount, errorCount, batchProcessed: true });
    }
  }

  return { successCount, errorCount, errors };
}
async function importStaff(jobId: string, festivalId: string, rows: any[]) {
  const emailsToLookup = new Set<string>();
  rows.forEach(r => {
    const email = r.Email || r.email;
    if (email) emailsToLookup.add(String(email).toLowerCase().trim());
  });

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: Array.from(emailsToLookup) } },
    select: { id: true, email: true }
  });
  const userMap = new Map(existingUsers.map(u => [u.email, u.id]));

  const existingStaff = await prisma.staffMember.findMany({
    where: { festivalId },
    select: { userId: true }
  });
  const staffUserIds = new Set(existingStaff.map(s => s.userId));

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validRowsToInsert: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNum = i + j + 2;
      
      const email = String(row.Email || row.email || "").toLowerCase().trim();
      
      const canScanTickets = String(row.CanScanTickets || row.canScanTickets || row['Can Scan Tickets'] || "false").toLowerCase() === 'true';
      const canEditLineup = String(row.CanEditLineup || row.canEditLineup || row['Can Edit Lineup'] || "false").toLowerCase() === 'true';
      const canManageStaff = String(row.CanManageStaff || row.canManageStaff || row['Can Manage Staff'] || "false").toLowerCase() === 'true';
      const canManageVendors = String(row.CanManageVendors || row.canManageVendors || row['Can Manage Vendors'] || "false").toLowerCase() === 'true';
      const active = String(row.Active || row.active || "true").toLowerCase() === 'true';
      
      if (!email) {
        errors.push({ row: rowNum, field: "global", issue: "Email is required" });
        errorCount++;
        continue;
      }

      const userId = userMap.get(email);
      if (!userId) {
        errors.push({ row: rowNum, field: "email", issue: `User with email '${email}' not found. They must sign up first.` });
        errorCount++;
        continue;
      }

      if (staffUserIds.has(userId)) {
        errors.push({ row: rowNum, field: "email", issue: `User with email '${email}' is already staff.` });
        errorCount++;
        continue;
      }

      staffUserIds.add(userId);
      validRowsToInsert.push({
        festivalId,
        userId,
        canScanTickets,
        canEditLineup,
        canManageStaff,
        canManageVendors,
        active
      });
    }

    if (validRowsToInsert.length > 0) {
      const res = await prisma.staffMember.createMany({
        data: validRowsToInsert,
        skipDuplicates: true
      });
      successCount += res.count;
    }
    
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-progress', { jobId, successCount, errorCount, batchProcessed: true });
    }
  }

  return { successCount, errorCount, errors };
}
async function importRegistrations(jobId: string, festivalId: string, rows: any[]) {
  // Pre-fetch all programmes and curbs
  const programmes = await prisma.programme.findMany({
    where: { festivalId },
    include: { curbs: true }
  });
  const progMap = new Map<string, any>(programmes.map(p => [p.code.toLowerCase().trim(), p]));

  // Pre-fetch all candidates
  const candidates = await prisma.candidate.findMany({
    where: { festivalId }
  });
  const candMap = new Map<string, any>();
  // We can look up candidate by Chest Number, or Name. Chest Number is much safer for imports.
  candidates.forEach(c => {
    if (c.chestNumber) {
      candMap.set(c.chestNumber.toLowerCase().trim(), c);
    }
  });

  // Pre-fetch all existing registrations to initialize Curb counters
  const existingRegs = await prisma.registration.findMany({
    where: { programme: { festivalId } },
    include: { candidate: true, programme: true }
  });

  // Counters:
  // teamProgCounts: `${programmeId}_${teamId}` -> count
  // candCatCounts: `${candidateId}_${categoryId}` -> count
  // existingRegsMap: `${programmeId}_${candidateId}` -> boolean (to prevent duplicate registrations)
  const teamProgCounts = new Map<string, number>();
  const candCatCounts = new Map<string, number>();
  const existingRegsSet = new Set<string>();

  existingRegs.forEach(reg => {
    existingRegsSet.add(`${reg.programmeId}_${reg.candidateId}`);

    if (reg.candidate.teamId) {
      const tpKey = `${reg.programmeId}_${reg.candidate.teamId}`;
      teamProgCounts.set(tpKey, (teamProgCounts.get(tpKey) || 0) + 1);
    }

    const ccKey = `${reg.candidateId}_${reg.programme.categoryId}`;
    candCatCounts.set(ccKey, (candCatCounts.get(ccKey) || 0) + 1);
  });

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validRowsToInsert: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNum = i + j + 2;
      
      const progCode = String(row.ProgrammeCode || row['Programme Code'] || row.programmeCode || "").toLowerCase().trim();
      const chestNumber = String(row.ChestNumber || row['Chest Number'] || row.chestNumber || "").toLowerCase().trim();
      const topicTitle = row.TopicTitle || row['Topic Title'] || row.topicTitle || null;
      
      if (!progCode || !chestNumber) {
        errors.push({ row: rowNum, field: "global", issue: "Programme Code and Chest Number are required" });
        errorCount++;
        continue;
      }

      const programme = progMap.get(progCode);
      if (!programme) {
        errors.push({ row: rowNum, field: "programmeCode", issue: `Programme Code '${progCode}' not found` });
        errorCount++;
        continue;
      }

      const candidate = candMap.get(chestNumber);
      if (!candidate) {
        errors.push({ row: rowNum, field: "chestNumber", issue: `Candidate with Chest Number '${chestNumber}' not found` });
        errorCount++;
        continue;
      }

      // Check Duplicates
      const regKey = `${programme.id}_${candidate.id}`;
      if (existingRegsSet.has(regKey)) {
        errors.push({ row: rowNum, field: "global", issue: `Candidate is already registered for this programme` });
        errorCount++;
        continue;
      }

      // Enforce Curbs
      let curbFailed = false;
      const curbs = programme.curbs || [];
      
      // 1. Team Limit
      if (candidate.teamId) {
        const tpKey = `${programme.id}_${candidate.teamId}`;
        const currentTeamCount = teamProgCounts.get(tpKey) || 0;
        
        for (const curb of curbs) {
          if (curb.maxEntriesPerTeam !== null && currentTeamCount >= curb.maxEntriesPerTeam) {
            errors.push({ row: rowNum, field: "curb", issue: `Team limit reached for programme (${curb.maxEntriesPerTeam})` });
            curbFailed = true;
            break;
          }
        }
      }

      if (curbFailed) {
        errorCount++;
        continue;
      }

      // 2. Category Limit
      const ccKey = `${candidate.id}_${programme.categoryId}`;
      const currentCatCount = candCatCounts.get(ccKey) || 0;
      
      for (const curb of curbs) {
        if (curb.maxEntriesPerCategory !== null && currentCatCount >= curb.maxEntriesPerCategory) {
          errors.push({ row: rowNum, field: "curb", issue: `Candidate category limit reached (${curb.maxEntriesPerCategory})` });
          curbFailed = true;
          break;
        }
      }

      if (curbFailed) {
        errorCount++;
        continue;
      }

      // If passed, apply to running counters
      existingRegsSet.add(regKey);
      if (candidate.teamId) {
        const tpKey = `${programme.id}_${candidate.teamId}`;
        teamProgCounts.set(tpKey, (teamProgCounts.get(tpKey) || 0) + 1);
      }
      candCatCounts.set(ccKey, (candCatCounts.get(ccKey) || 0) + 1);

      validRowsToInsert.push({
        programmeId: programme.id,
        candidateId: candidate.id,
        topicTitle: topicTitle ? String(topicTitle) : null
      });
    }

    if (validRowsToInsert.length > 0) {
      const res = await prisma.registration.createMany({
        data: validRowsToInsert,
        skipDuplicates: true
      });
      successCount += res.count;
    }
    
    const pusher = pusherServer;
    if (pusher) {
      await pusher.trigger(`festival-${festivalId}-imports`, 'job-progress', { jobId, successCount, errorCount, batchProcessed: true });
    }
  }

  return { successCount, errorCount, errors };
}


