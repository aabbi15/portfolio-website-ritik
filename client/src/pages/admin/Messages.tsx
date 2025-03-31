import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Calendar } from "lucide-react";

type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null);
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/admin/contacts'],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            View and manage contact form submissions
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No messages</CardTitle>
              <CardDescription>
                You haven't received any messages yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Messages from your contact form will appear here when people reach out to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {contact.subject || "No subject"}
                    </TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMessage(contact)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <Dialog open={selectedMessage !== null} onOpenChange={() => setSelectedMessage(null)}>
        {selectedMessage && (
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Message from {selectedMessage.name}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMessage.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">
                {selectedMessage.subject || "No subject"}
              </h4>
              <p className="text-muted-foreground whitespace-pre-line">
                {selectedMessage.message}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="default"
                onClick={() => {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${
                    selectedMessage.subject || "Your inquiry"
                  }`;
                }}
              >
                Reply via Email
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}