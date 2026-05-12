import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";
import CookieHelper from "@/utils/cookie-helper";

// Khai báo kiểu Socket với các sự kiện tùy chỉnh
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class SocketClient {
  private static socket: AppSocket | null = null;

  static getInstance(): AppSocket {
    if (!this.socket) {
      const token = CookieHelper.getItem("token") as string;
      this.socket = io(process.env.NEXT_PUBLIC_HOST || "http://localhost:8000", {
        auth: {
          token: token,
        },
      });

      this.socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });
    }
    return this.socket;
  }

  static on<Event extends keyof ServerToClientEvents>(
    event: Event,
    callback: ServerToClientEvents[Event]
  ): void {
    // Sử dụng any để bỏ qua kiểm tra kiểu dữ liệu
    (this.getInstance() as any).on(event, callback);
  }

  static emit<Event extends keyof ClientToServerEvents>(
    event: Event,
    ...args: Parameters<ClientToServerEvents[Event]>
  ): void {
    this.getInstance().emit(event, ...args);
  }

  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
