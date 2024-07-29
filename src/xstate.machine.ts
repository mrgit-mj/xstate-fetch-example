import { assign, fromPromise, setup } from 'xstate';

export const apiRequestsMachine = setup({
  types: {
    context: {} as { results: Array<{ id: number; success: boolean; data: any }> },
    events: {} as { type: 'FETCH' }
  },
  actors: {
    fetchData: fromPromise(
      async ({ input }: { input: { endpoint: string } }) => {
        // This is a placeholder. In the real implementation, 
        // you'd use the HttpService here.
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { data: `Data from ${input.endpoint}` };
      }
    )
  }
}).createMachine({
  id: 'apiRequests',
  context: { results: [] },
  initial: 'Idle',
  states: {
    Idle: {
      on: { FETCH: 'FetchingFirst' }
    },
    FetchingFirst: {
      invoke: {
        src: 'fetchData',
        input: { endpoint: '/posts/1' },
        onDone: {
          target: 'FetchingSecond',
          actions: assign({
            results: ({ context, event }) => [...context.results, { id: 1, success: true, data: event.output.data }]
          })
        },
        onError: {
          target: 'FetchingSecond',
          actions: assign({
            results: ({ context }) => [...context.results, { id: 1, success: false, data: null }]
          })
        }
      }
    },
    FetchingSecond: {
      invoke: {
        src: 'fetchData',
        input: { endpoint: '/posts/2' },
        onDone: {
          target: 'FetchingThird',
          actions: assign({
            results: ({ context, event }) => [...context.results, { id: 2, success: true, data: event.output.data }]
          })
        },
        onError: {
          target: 'FetchingThird',
          actions: assign({
            results: ({ context }) => [...context.results, { id: 2, success: false, data: null }]
          })
        }
      }
    },
    FetchingThird: {
      invoke: {
        src: 'fetchData',
        input: { endpoint: '/posts/3' },
        onDone: {
          target: 'Done',
          actions: assign({
            results: ({ context, event }) => [...context.results, { id: 3, success: true, data: event.output.data }]
          })
        },
        onError: {
          target: 'Done',
          actions: assign({
            results: ({ context }) => [...context.results, { id: 3, success: false, data: null }]
          })
        }
      }
    },
    Done: {
      type: 'final',
      output: ({ context }) => ({ results: context.results })
    }
  }
});