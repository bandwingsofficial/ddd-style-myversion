import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/public/outlets',
  cors: {
    origin: '*', // tighten later if needed
  },
})
export class OutletPublicGateway {
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* ROOM MANAGEMENT                                   */
  /* ================================================= */

  @SubscribeMessage('join_outlet')
  handleJoinOutlet(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { outletId: string },
  ) {
    if (!payload?.outletId) return;

    const room = `outlet:${payload.outletId}`;
    client.join(room);

    client.emit('joined_outlet', {
      outletId: payload.outletId,
    });
  }

  @SubscribeMessage('leave_outlet')
  handleLeaveOutlet(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { outletId: string },
  ) {
    if (!payload?.outletId) return;

    const room = `outlet:${payload.outletId}`;
    client.leave(room);

    client.emit('left_outlet', {
      outletId: payload.outletId,
    });
  }

  /* ================================================= */
  /* WORKING STATUS                                    */
  /* ================================================= */

  emitWorkingStatus(payload: {
    outletId: string;
    status: string;
  }): void {
    this.server
      .to(`outlet:${payload.outletId}`)
      .emit('outlet.working-status', payload);
  }

  /* ================================================= */
  /* CAMERA                                            */
  /* ================================================= */

  emitCameraStatus(payload: {
    outletId: string;
    status: 'ON' | 'OFF';
  }): void {
    this.server
      .to(`outlet:${payload.outletId}`)
      .emit('outlet.camera-status', payload);
  }

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitLifecycle(payload: {
    outletId: string;
    status: 'ACTIVE' | 'INACTIVE';
  }): void {
    this.server
      .to(`outlet:${payload.outletId}`)
      .emit('outlet.lifecycle', payload);
  }
}
