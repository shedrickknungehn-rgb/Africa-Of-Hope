import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonateFab from "@/components/DonateFab";
import LiveChat from "@/components/LiveChat";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Charity from "@/pages/Charity";
import Education from "@/pages/Education";
import Healthcare from "@/pages/Healthcare";
import MediaTV from "@/pages/MediaTV";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import Advocacy from "@/pages/Advocacy";
import Team from "@/pages/Team";
import SchoolLogin from "@/pages/school/SchoolLogin";
import SchoolDashboard from "@/pages/school/SchoolDashboard";
import LiveClass from "@/pages/school/LiveClass";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const [location] = useLocation();
  const isSchool = location.startsWith("/school");

  return (
    <>
      {!isSchool && <Navbar />}
      <Switch>
        <Route path="/school" component={SchoolLogin} />
        <Route path="/school/dashboard" component={SchoolDashboard} />
        <Route path="/school/class/:id" component={LiveClass} />

        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/charity" component={Charity} />
        <Route path="/education" component={Education} />
        <Route path="/healthcare" component={Healthcare} />
        <Route path="/media" component={MediaTV} />
        <Route path="/advocacy" component={Advocacy} />
        <Route path="/team" component={Team} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      {!isSchool && <Footer />}
      {!isSchool && <DonateFab />}
      {!isSchool && <LiveChat />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base="/">
          <div className="flex flex-col min-h-screen">
            <AppRoutes />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
