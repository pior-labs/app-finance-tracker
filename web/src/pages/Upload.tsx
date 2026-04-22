import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function UploadPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload statement</CardTitle>
          <CardDescription>PDF upload flow is scaffolded and marked for Phase 1 functional implementation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept="application/pdf" />
          <Button type="button">Upload (placeholder)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date uploaded</TableHead>
                <TableHead>Transaction count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                  No uploads yet (placeholder)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
