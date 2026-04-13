import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";

export interface StudentResult {
    id: string;
    studentName: string;
    score: number;
    total: number;
    date: string;
    status: 'passed' | 'failed';
}

interface ResultsTableProps {
  results: StudentResult[];
  onViewDetails: (id: string) => void;
}

export function ResultsTable({ results, onViewDetails }: ResultsTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_20px_50px_rgba(25,28,30,0.06)] overflow-hidden">
        <Table>
        <TableHeader className="bg-surface-container-low border-none">
            <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-right text-on-surface-variant font-bold py-6">اسم الطالب</TableHead>
            <TableHead className="text-right text-on-surface-variant font-bold">الدرجة</TableHead>
            <TableHead className="text-right text-on-surface-variant font-bold">تاريخ الاختبار</TableHead>
            <TableHead className="text-right text-on-surface-variant font-bold">الحالة</TableHead>
            <TableHead className="text-right text-on-surface-variant font-bold">الإجراءات</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {results.map((result) => (
            <TableRow key={result.id} className="border-b border-surface-container-high hover:bg-surface-container-low/50 transition-colors">
                <TableCell className="py-6 font-bold text-on-surface">{result.studentName}</TableCell>
                <TableCell className="font-bold">
                    <span className="text-primary">{result.score}</span> / {result.total}
                </TableCell>
                <TableCell className="text-on-surface-variant">{result.date}</TableCell>
                <TableCell>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.status === 'passed' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                       {result.status === 'passed' ? 'ناجح' : 'راسب'}
                   </span>
                </TableCell>
                <TableCell>
                    <Button variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => onViewDetails(result.id)}>
                        عرض التفاصيل
                    </Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
