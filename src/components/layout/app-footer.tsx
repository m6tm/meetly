const AppFooter = () => {
  return (
    <footer className="border-t border-border/40 py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Meetly. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
          <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
