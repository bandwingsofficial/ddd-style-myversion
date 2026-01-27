// src/modules/outlets/gateways/outlet-public.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { OutletService } from '../services/outlet.service';

@WebSocketGateway({
  namespace: '/public/outlets',
  cors: {
    origin: '*',
  },
})
export class OutletPublicGateway
  implements OnGatewayConnection
{
  constructor(
    private readonly outletService: OutletService, // ⭐ NEW
  ) {}

  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* ⭐ INITIAL CONNECT – SEND OUTLETS IMMEDIATELY       */
  /* ================================================= */

  async handleConnection(client: Socket) {
  try {
    // ⭐ SAFE READ (query OR auth OR string)
    const lat =
      client.handshake.query?.lat ??
      client.handshake.auth?.lat;

    const lng =
      client.handshake.query?.lng ??
      client.handshake.auth?.lng;

    console.log('🔍 FULL HANDSHAKE =>', client.handshake);

    if (!lat || !lng) {
      console.log('⚠️ Socket connected without lat/lng');
      return;
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    console.log(
      `📡 Outlet socket connect → lat=${latitude}, lng=${longitude}`,
    );

    const outlets =
      await this.outletService.getNearbyOutlets(
        latitude,
        longitude,
      );

    console.log(
      `📦 Initial outlets sent → count=${outlets.length}`,
    );

    client.emit('outlets.updated', {
      outlets,
    });
  } catch (e) {
    console.error('❌ Outlet socket init failed', e);
  }
}


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
