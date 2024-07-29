import { Injectable } from '@nestjs/common';
import { createActor, fromPromise } from 'xstate';
import { apiRequestsMachine } from './xstate.machine';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AutomationService {
  constructor(private httpService: HttpService) {}

  private async fetchData(endpoint: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`https://jsonplaceholder.typicode.com${endpoint}`)
    );
    return { data };
  }

  async runAutomation() {
    const machineWithAddedMethods = apiRequestsMachine.provide({
      actors: {
        fetchData: fromPromise(
          async ({ input }: { input: { endpoint: string } }) => {
            return this.fetchData(input.endpoint)
          }
        )
      }
    });

    const actor = createActor(machineWithAddedMethods);

    actor.subscribe((state) => {
      console.log('Current state:', state.value);
      console.log('Context:', state.context);
    });

    actor.start();
    actor.send({ type: 'FETCH' });

    const finalState = actor.getSnapshot();

    return finalState.output || [];
  }
}