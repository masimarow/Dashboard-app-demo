import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreativeFatigueStatus } from "@/lib/creative-fatigue";

interface CreativeFatigueTableProps {
  statuses: CreativeFatigueStatus[];
}

export function CreativeFatigueTable({ statuses }: CreativeFatigueTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">クリエイティブ疲弊アラート</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>クリエイティブ</TableHead>
              <TableHead className="text-right">フリークエンシー</TableHead>
              <TableHead className="text-right">CTR低下率</TableHead>
              <TableHead className="text-right">ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((s) => (
              <TableRow key={s.adCreativeId}>
                <TableCell className="font-medium">{s.adCreativeId}</TableCell>
                <TableCell className="text-right">
                  {s.currentFrequency.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {s.hasEnoughData ? `${(s.ctrDeclineRate * 100).toFixed(1)}%` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {!s.hasEnoughData ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      データ不足
                    </Badge>
                  ) : s.isFatigued ? (
                    <Badge variant="destructive">要差し替え</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      良好
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}