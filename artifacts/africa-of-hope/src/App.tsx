import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonateFab from "@/components/DonateFab";
import LiveChat from "@/components/LiveChat";
import Home from "@/pages/Home";

const About = lazy(() => import("@/pages/About"));
const Charity = lazy(() => import("@/pages/Charity"));
const Education = lazy(() => import("@/pages/Education"));
const Healthcare = lazy(() => import("@/pages/Healthcare"));
const MediaTV = lazy(() => import("@/pages/MediaTV"));
const Contact = lazy(() => import("@/pages/Contact"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Advocacy = lazy(() => import("@/pages/Advocacy"));
const Team = lazy(() => import("@/pages/Team"));
const SchoolLogin = lazy(() => import("@/pages/school/SchoolLogin"));
const SchoolDashboard = lazy(() => import("@/pages/school/SchoolDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0d3d1a]" />
    </div>
  );
}

function AppRoutes() {
  const [location] = useLocation();
  const isSchool = location.startsWith("/school");

  return (
    <>
      {!isSchool && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/school" component={SchoolLogin} />
          <Route path="/school/dashboard" component={SchoolDashboard} />

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
      </Suspense>
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
