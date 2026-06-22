'use client';
import { Card } from '@/components/ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { AirQualityData } from '@/types';

/**
 * PM2.5 값 → 등급/색상/이모지 매핑
 * - 좋음: ≤15 μg/m³
 * - 보통: ≤35
 * - 나쁨: ≤75
 * - 매우 나쁨: >75
 * (한국 환경부 기준 단순화)
 */
function grade(pm25: number): { label: string; color: string; emoji: string } {
  if (pm25 <= 15) return { label: '좋음', color: 'var(--color-tds-green)', emoji: '😊' };
  if (pm25 <= 35) return { label: '보통', color: 'var(--color-tds-yellow)', emoji: '😐' };
  if (pm25 <= 75) return { label: '나쁨', color: 'var(--color-tds-orange)', emoji: '😷' };
  return { label: '매우 나쁨', color: 'var(--color-tds-red)', emoji: '🤢' };
}

export interface AirQualityCardProps {
  data: AirQualityData;
}

/**
 * 미세먼지 카드 — 도넛(라디얼) 게이지로 PM2.5 표시
 * PM10, level 필드는 색상/이모지 계산에 활용되지 않으므로 단순 표시용으로 사용 가능
 */
export function AirQualityCard({ data }: AirQualityCardProps) {
  const pm25 = data.current.pm2_5;
  const g = grade(pm25);
  // 게이지 0~100% 스케일로 정규화 (최대 100 μg/m³ 기준)
  const ratio = Math.min(100, (pm25 / 100) * 100);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌫️</span>
        <h3 className="text-tds-st1 font-medium">미세먼지</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ name: 'pm25', value: ratio, fill: g.color }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: 'var(--color-tds-grey-100)' }}
                dataKey="value"
                cornerRadius={6}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-tds-t2 font-bold" style={{ color: g.color }}>
            {g.label}
          </div>
          <div className="text-tds-st3 text-tds-grey-500">
            PM2.5 {pm25} μg/m³ {g.emoji}
          </div>
        </div>
      </div>
    </Card>
  );
}