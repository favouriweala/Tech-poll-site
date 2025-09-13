import { NextRequest } from 'next/server';
import { pollUpdateEmitter } from '@/lib/events';
import { getPollWithResults } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pollId = params.id;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const sendUpdate = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}

`));
      };

      const updateHandler = async () => {
        const updatedPoll = await getPollWithResults(pollId);
        sendUpdate(updatedPoll);
      };

      pollUpdateEmitter.on(`update-${pollId}`, updateHandler);

      request.signal.addEventListener('abort', () => {
        pollUpdateEmitter.off(`update-${pollId}`, updateHandler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
