export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import MarkReadButton from "@/components/admin/MarkReadButton";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Повідомлення</h1>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">Повідомлень ще немає</Card>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{msg.name}</span>
                    <span className="text-sm text-gray-500">{msg.email}</span>
                    <Badge variant={msg.read ? "default" : "warning"}>
                      {msg.read ? "Прочитано" : "Нове"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</p>
                  <p className="text-sm text-gray-600">{msg.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(msg.createdAt)}</p>
                </div>
                {!msg.read && <MarkReadButton messageId={msg.id} />}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
