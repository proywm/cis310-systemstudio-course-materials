export type DigitalLaunchFailureKind = 'docker-engine-stopped' | 'docker-missing' | 'generic';

export interface DigitalLaunchDiagnosis {
  kind: DigitalLaunchFailureKind;
  title: string;
  summary: string;
  explanation: string;
  steps: readonly string[];
  technicalDetail: string;
}

/** Turns low-level launcher output into a student-facing recovery path without hiding evidence. */
export function diagnoseDigitalLaunchFailure(detail: string): DigitalLaunchDiagnosis {
  const technicalDetail = detail.trim() || 'No technical detail was reported.';
  if (/docker desktop is installed but its engine is not ready|docker_engine|cannot connect to the docker daemon|docker service is unavailable|is the docker daemon running/i.test(technicalDetail)) {
    return {
      kind: 'docker-engine-stopped',
      title: 'Docker Desktop is not running',
      summary: 'Your circuit is safe. SystemStudio found Docker, but the Docker background engine is stopped or not ready.',
      explanation: 'On Windows and macOS, SystemStudio uses a small course container to run the complete Java/Swing Digital application and stream it into this VS Code tab. Docker Desktop supplies that isolated Linux display; it is not used to change your circuit.',
      steps: [
        'Open Docker Desktop and wait until it reports that the engine is running.',
        'Return to this tab and choose “Retry embedded Digital.”',
        'If Docker cannot run, use native Digital only when Java 8 or newer is installed; otherwise open the setup guide.'
      ],
      technicalDetail
    };
  }
  if (/requires docker desktop|docker executable|docker command|install and start docker desktop/i.test(technicalDetail)) {
    return {
      kind: 'docker-missing',
      title: 'Docker Desktop is required for the in-tab simulator',
      summary: 'Your circuit is safe. This computer does not currently provide the Docker runtime used by embedded Full Digital.',
      explanation: 'The original Digital editor is a Java/Swing desktop application, not a web page. On Windows and macOS, the course container supplies Java and the private graphical display that lets VS Code show the full application inside a tab.',
      steps: [
        'Install and start Docker Desktop using the course setup guide.',
        'Return to this tab and choose “Retry embedded Digital.”',
        'If Java 8 or newer is already installed, native Digital can be used as a temporary fallback.'
      ],
      technicalDetail
    };
  }
  return {
    kind: 'generic',
    title: 'Embedded Full Digital could not start',
    summary: 'Your circuit file was not changed. The simulator runtime stopped before its graphical session became ready.',
    explanation: 'Use the recovery steps below, then keep the technical detail if you need to ask for help.',
    steps: [
      'Run the SystemStudio environment check and fix the first reported problem.',
      'Return to this tab and choose “Retry embedded Digital.”',
      'Open the setup guide for platform-specific instructions or copy the technical detail when asking for help.'
    ],
    technicalDetail
  };
}
