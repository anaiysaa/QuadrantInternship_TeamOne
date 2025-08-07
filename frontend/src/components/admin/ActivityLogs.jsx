import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = filterType === "All"
    ? logs
    : logs.filter(log => log.type === filterType);

  const countByType = (type) =>
    logs.filter((log) => log.type === type).length;

  const actionTypes = ["Admin", "HR", "IT", "User"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        {actionTypes.map((type) => (
          <Card
            key={type}
            className="w-48 cursor-pointer hover:shadow-md"
            onClick={() => setFilterType(type)}
          >
            <CardHeader>
              <CardTitle className="text-center text-sm">{type}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-xl font-semibold">{countByType(type)}</p>
            </CardContent>
          </Card>
        ))}
        <Card
          className="w-48 cursor-pointer hover:shadow-md"
          onClick={() => setFilterType("All")}
        >
          <CardHeader>
            <CardTitle className="text-center text-sm">All</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-xl font-semibold">{logs.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-auto rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <Badge>{log.type}</Badge>
                </TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  No logs available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
