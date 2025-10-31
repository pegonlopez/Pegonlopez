
export enum AppState {
  ReadyToUpload,
  ReadyToProcess,
  Processing,
  Complete,
}

export enum ProcessingOption {
  Medical = 'Consulta Médica',
  Meeting = 'Reunión de Trabajo',
  Summary = 'Resumen Simple',
  SoloTranscripcion = 'Solo Transcripción',
  Custom = 'Personalizado',
}