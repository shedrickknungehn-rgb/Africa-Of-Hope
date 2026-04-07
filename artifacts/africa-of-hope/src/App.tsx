import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonateFab from "@/components/DonateFab";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Charity from "@/pages/Charity";
import Education from "@/pages/Education";
import Healthcare from "@/pages/Healthcare";
import MediaTV from "@/pages/MediaTV";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/charity" component={Charity} />
          <Route path="/education" component={Education} />
          <Route path="/healthcare" component={Healthcare} />
          <Route path="/media" component={MediaTV} />
          <Route path="/contact" component={Contact} />
          <Route path="/gallery" component={Gallery} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <DonateFab />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
