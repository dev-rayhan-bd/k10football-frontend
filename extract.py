import os

path = './src/components/cvs/player-cv-details/PlayerBioSection.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

startCardIndex = -1
strengthIndex = -1

for i, line in enumerate(lines):
    if '{/* Certification Card */}' in line and startCardIndex == -1:
        startCardIndex = i
    if 'Strength' in line and strengthIndex == -1:
        strengthIndex = i

endCardIndex = -1
for i in range(strengthIndex, startCardIndex - 1, -1):
    if '</div>' in lines[i]:
        endCardIndex = i
        break

if startCardIndex != -1 and endCardIndex != -1:
    cardLines = lines[startCardIndex:endCardIndex+1]
    
    componentCode = """import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const VerifiedBadge = ({ playerData }: { playerData: any }) => {
  return (
    <>
""" + '\n'.join(cardLines) + """
    </>
  );
};
"""
    
    with open('./src/components/cvs/player-cv-details/VerifiedBadge.tsx', 'w', encoding='utf-8') as f:
        f.write(componentCode)
        
    newLines = lines[:startCardIndex] + [
        '              <div className="hidden xl:block w-full min-w-0">',
        '                <VerifiedBadge playerData={playerData} />',
        '              </div>'
    ] + lines[endCardIndex+1:]
    
    lastImport = -1
    for i, line in enumerate(newLines):
        if line.startswith('import '):
            lastImport = i
            
    if lastImport != -1:
        newLines.insert(lastImport + 1, 'import { VerifiedBadge } from "./VerifiedBadge";')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(newLines))
    print('Extraction successful!')
else:
    print('Indices not found:', startCardIndex, endCardIndex)
