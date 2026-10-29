import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import LendariosApp from './LendariosApp';
export default function App(){return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster/><LendariosApp/></TooltipProvider></ThemeProvider></ErrorBoundary>}
