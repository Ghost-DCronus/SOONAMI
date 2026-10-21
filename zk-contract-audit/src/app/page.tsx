"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { ShieldCheck, AlertTriangle, Code, Play, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState<string>(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVault {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // Vulnerable to reentrancy attack
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= _amount;
    }
}`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResults, setAuditResults] = useState<any[]>([]);

  const handleRunAudit = () => {
    setIsAnalyzing(true);
    setAuditResults([]);

    // Client-side rule engine simulation (Step 2 will replace with full AST/WASM engine)
    setTimeout(() => {
      const issues = [];

      if (code.includes(".call{value:") && code.indexOf(".call{value:") < code.indexOf("balances[msg.sender] -=")) {
        issues.push({
          id: 1,
          severity: "High",
          title: "Potential Reentrancy Vulnerability",
          description: "State change occurs after low-level call. Ensure Checks-Effects-Interactions pattern is applied.",
          line: 14,
        });
      }

      if (!code.includes("ReentrancyGuard")) {
        issues.push({
          id: 2,
          severity: "Medium",
          title: "Missing Reentrancy Guard",
          description: "Consider importing OpenZeppelin ReentrancyGuard for payable state-changing methods.",
          line: 12,
        });
      }

      setAuditResults(issues);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">ZK-Audit Protocol</h1>
            <p className="text-xs text-slate-400">Zero-Knowledge Client-Side Smart Contract Auditor</p>
          </div>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-md transition-colors text-sm disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span>Analyzing AST...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Run Instant Audit
            </>
          )}
        </button>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Code Editor Panel */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 flex flex-col">
          <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" /> contract.sol
            </span>
            <span>Solidity ^0.8.20</span>
          </div>
          <div className="flex-1 min-h-[400px]">
            <Editor
              height="100%"
              defaultLanguage="sol"
              language="sol"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

        {/* Audit Results Panel */}
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-4 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            Audit Security Analysis
            <span className="text-xs font-normal text-slate-500">({auditResults.length} issues found)</span>
          </h2>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {auditResults.length === 0 && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mb-2 text-slate-700" />
                <p className="text-sm">Click "Run Instant Audit" to inspect your smart contract.</p>
              </div>
            )}

            {auditResults.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-lg bg-slate-950/60 border border-amber-500/30 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {issue.title}
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                    Line {issue.line}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
