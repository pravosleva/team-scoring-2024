// NOTE: NES is gloal for this

const withCustomEmitters = ({
  eventData,
  socket,
  _cb,
}) => {

  // console.log('-- withCustomEmitters | eventData:')
  // console.log(eventData)

  const {
    __eType,
    input,
    // specialClientKey,
  } = eventData

  // console.log(`-- __eType: ${__eType}`)

  // - NOTE: Level 1: Client -> Worker communication events
  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      // console.log('-- CLIENT_TO_WORKER_MESSAGE')
      // -- NOTE: Level 2: Different app event types
      switch (true) {
        case eventData?.input?.metrixEventType === NES.Socket.Metrix.EClientOutgoing.PING:
          console.log('-- PING!')
          let outputData = {
            ...input,
            // specialClientKey,
            _wService: {
              _perfInfo,
            },
          }
          socket.emit(input.metrixEventType, outputData, (socketEvent) => {
            log({ label: 'c->w:port:listener:eventType:report->socket->[cb]', msgs: [socketEvent] })
            if (typeof _cb === 'function') {
              _cb({ eventData, _message: 'PING: level 2.1/done: socket sent [hello from cb]', socketEvent })
            }
          })
          break
        // --- NOTE: Special report by user (UI testing by Alexey)
        // case eventData?.input?.metrixEventType === NES.Socket.Metrix.EClientOutgoing.SP_HISTORY_REPORT_EV:
        // case eventData?.input?.metrixEventType === NES.Socket.Metrix.EClientOutgoing._SP_HISTORY_REPORT_EV_DEPRECATED: {
        //   if (typeof _cb === 'function') _cb({ eventData, _message: 'level 2.1' })
        //   // log({ label: 'c->[w:port:listener:eventType:report]->socket', msgs: [input] })
        //   let outputData = {
        //     ...input,
        //     // specialClientKey,
        //     _wService: {
        //       _perfInfo,
        //     },
        //   }
        //   socket.emit(input.metrixEventType, outputData, (socketEvent) => {
        //     log({ label: 'c->w:port:listener:eventType:report->socket->[cb]', msgs: [socketEvent] })
        //     if (typeof _cb === 'function') _cb({ eventData, _message: 'level 2.1/done: socket sent [hello from cb]', socketEvent })
        //   })
        //   break
        // }
        // ---
        // case eventData?.input?.metrixEventType === NES.Socket.Metrix.EClientOutgoing.SP_MX_EV: {
        //   let outputData = {
        //     ...input,
        //     // specialClientKey,
        //   }

        //   // ---- NOTE: Level 3: Internal app state handlers
        //   switch (true) {
        //     // === NOTE: Hard logs
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.AppInitErr:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.SendImeiErr:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.EnterMemoryAndColor:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.SendCheckFMIPOn:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.PrePriceTable:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.CheckPhone:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.GetPhotoLink:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.UploadPhotoResultIsFuckup:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.FinalPriceTable:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.Contract:
        //     // case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.ContractSending:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.ContractError:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.Final:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.FinalScenarioErr:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.ActPrint:
        //     case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.Final: {
        //       if (typeof _cb === 'function') _cb({ eventData, _message: 'level 3.1' })
        //       socket.emit(input.metrixEventType, {
        //         ...outputData,
        //         _wService: {
        //           _perfInfo,
        //         },
        //       }, (socketEvent) => {
        //         log({ label: 'c->sw:port:listener:metrixEventType:detailed->s->[cb]', msgs: [socketEvent] })
        //         if (typeof _cb === 'function') _cb({ eventData, _message: 'level 3.1/done: socket sent [hello from cb]', socketEvent })
        //       })
        //       break
        //     }
        //     // ===
        //     // === NOTE: Lite logs
        //     // case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.AppInit:
        //     // case eventData?.input.stateValue === NES.Custom.Client.EStepMachine.ContractSending:
        //     default:
        //       if (typeof _cb === 'function') _cb({ eventData, _message: 'level 3.2' })
        //       socket.emit(input.metrixEventType, outputData, (socketEvent) => {
        //         log({ label: 'c->sw:port:listener:metrixEventType:default->s->[cb]', msgs: [socketEvent] })
        //         if (typeof _cb === 'function') _cb({ eventData, _message: 'level 3.2/done: socket sent [hello from cb]', socketEvent })
        //       })
        //       break
        //     // ===
        //   }
        //   // ----

        // }
        default:
          console.log(`-- UNKNOWN (2) eventData?.input?.metrixEventType: ${eventData?.input?.metrixEventType}`)
          break

      }
      // --

      break
    }
    default:
      console.log(`-- UNKNOWN (1) __eType: ${__eType}`)
      break
  }
  // -
}
