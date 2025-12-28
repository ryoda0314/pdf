'use client';

import React from 'react';
import { UploadZone } from './UploadZone';

interface HomeProps {
    onFileSelect: (file: File) => void;
}

export function Home({ onFileSelect }: HomeProps) {
    return (
        <div className="h-screen w-screen bg-neutral-900 flex overflow-hidden font-sans selection:bg-orange-500 selection:text-white">

            {/* Left Panel: The "Machine" / Information - Dark, Industrial, Technical */}
            <div className="hidden lg:flex w-5/12 xl:w-1/3 flex-col justify-between p-12 relative border-r border-white/10 bg-neutral-900">

                {/* Background Grid - Technical aesthetic */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Header / Brand */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-500 flex items-center justify-center font-mono font-bold text-black text-lg">
                            P
                        </div>
                        <span className="font-mono text-sm tracking-widest text-neutral-400 uppercase">System v1.0</span>
                    </div>
                </div>

                {/* Main Typography */}
                <div className="relative z-10 space-y-8">
                    <h1 className="text-6xl xl:text-7xl font-bold text-white leading-none tracking-tighter">
                        PDF <br />
                        <span className="text-neutral-500">CONTROL</span> <br />
                        CENTER
                    </h1>

                    <div className="space-y-6 max-w-sm">
                        <p className="text-lg text-neutral-400 font-light border-l-2 border-orange-500 pl-6 leading-relaxed">
                            Precision tools for document compositing. Merge, reorder, and structure your PDFs without server transmission.
                        </p>
                    </div>
                </div>

                {/* Technical Specs / Details */}
                <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    <div>
                        <h4 className="font-mono text-xs text-orange-500 mb-2 uppercase tracking-wider">Operation</h4>
                        <p className="text-neutral-300 font-medium">Local / Client-Side</p>
                    </div>
                    <div>
                        <h4 className="font-mono text-xs text-orange-500 mb-2 uppercase tracking-wider">Security</h4>
                        <p className="text-neutral-300 font-medium">Air-Gapped Logic</p>
                    </div>
                    <div>
                        <h4 className="font-mono text-xs text-orange-500 mb-2 uppercase tracking-wider">Latency</h4>
                        <p className="text-neutral-300 font-medium">0ms (Instant)</p>
                    </div>
                    <div>
                        <h4 className="font-mono text-xs text-orange-500 mb-2 uppercase tracking-wider">Max Load</h4>
                        <p className="text-neutral-300 font-medium">50MB / File</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: The "Workspace" / Action - Light, Spacious, Clean */}
            <div className="flex-1 bg-neutral-100 flex flex-col relative px-8 py-8 md:px-16 md:py-12">

                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 p-8">
                    <div className="w-24 h-24 border-t-2 border-r-2 border-neutral-300 rounded-tr-3xl"></div>
                </div>

                {/* Mobile Header (Visible only on small screens) */}
                <div className="lg:hidden mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 flex items-center justify-center font-mono font-bold text-white text-lg rounded">P</div>
                        <span className="font-bold text-neutral-900 tracking-tight">PDF Control</span>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full max-w-3xl mx-auto">

                    <div className="w-full mb-8 text-center lg:text-left">
                        <span className="hidden lg:inline-block font-mono text-xs text-neutral-400 mb-4 tracking-widest uppercase">
                            // Awaiting Input
                        </span>
                        <h2 className="text-3xl md:text-5xl font-light text-neutral-900 mb-2">
                            Initialize Workflow
                        </h2>
                        <p className="text-neutral-500">Drop documents to begin processing sequence.</p>
                    </div>

                    {/* Bold Upload Zone Container */}
                    <div className="w-full bg-white rounded-none border border-neutral-200 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[15px_15px_0px_0px_rgba(249,115,22,0.1)] transition-all duration-300 p-2">
                        <div className="border border-dashed border-neutral-300 bg-neutral-50/50 p-16 md:p-24 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white transition-colors">
                            <UploadZone onFileSelect={onFileSelect} />
                            <div className="mt-8 flex flex-col gap-2">
                                <span className="font-medium text-neutral-900 group-hover:text-orange-600 transition-colors">
                                    Click to Browse or Drag Files
                                </span>
                                <span className="text-xs text-neutral-400 font-mono">
                                    Supported Formats: .PDF
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Note */}
                <div className="mt-auto text-center lg:text-left pt-8 text-neutral-400 text-sm font-light flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>System Operational</span>
                </div>

            </div>
        </div>
    );
}
