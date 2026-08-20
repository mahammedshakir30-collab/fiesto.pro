"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function VendorMenuPage() {
  const [items, setItems] = useState([
    { id: '1', name: 'Signature Burger', price: 1400, inStock: true },
    { id: '2', name: 'Truffle Fries', price: 800, inStock: true },
    { id: '3', name: 'Craft Soda', price: 500, inStock: false },
  ]);

  const toggleStock = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, inStock: !i.inStock } : i));
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground mt-2">Manage your POS items and mark things out of stock.</p>
        </div>
        <Button className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
              <th className="p-4 font-medium">Item Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-soft group">
                <td className="p-4 font-bold text-base">{item.name}</td>
                <td className="p-4 font-display text-xl text-color-primary">
                  {(item.price / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-10 h-6 rounded-full relative transition-all ${item.inStock ? 'bg-color-success' : 'bg-muted'}`} onClick={() => toggleStock(item.id)}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.inStock ? 'right-1' : 'left-1'}`}></div>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.inStock ? 'text-color-success' : 'text-muted-foreground'}`}>
                      {item.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </label>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-soft">
                    <button className="p-2 text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
