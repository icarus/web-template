"use client";

import React from "react";

export interface TabsProps {
  tabs: string[];
  selectedTab: string;
  onSelect: (tab: string) => void;
}

export function Tabs({ tabs, selectedTab, onSelect }: TabsProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          style={{
            padding: "4px 8px",
            border: "1px solid #ddd",
            background: selectedTab === tab ? "#ddd" : "#fff",
            cursor: "pointer"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
