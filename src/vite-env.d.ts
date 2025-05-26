
/// <reference types="vite/client" />

import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    getNumberOfPages(): number;
  }
}
