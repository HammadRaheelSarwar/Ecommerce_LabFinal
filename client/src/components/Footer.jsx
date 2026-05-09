import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest text-secondary w-full py-section-gap border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto md:px-margin-desktop px-margin-mobile">
        <div className="flex flex-col gap-4">
          <div className="font-headline-sm text-secondary font-bold">All Available</div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            © 2024 All Available. Engineered for Excellence.
            <br />
            <span className="mt-2 block">
              Created by <a href="https://hrsportfolio-nine.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline underline-offset-2">Hammad Raheel Sarwar</a>
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-caps text-label-caps text-on-surface">Legal</h4>
          <nav className="flex flex-col gap-2">
            <a className="font-body-md text-body-md text-on-tertiary-container hover:text-on-surface hover:underline decoration-secondary underline-offset-4 transition-opacity duration-500" href="#">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-tertiary-container hover:text-on-surface hover:underline decoration-secondary underline-offset-4 transition-opacity duration-500" href="#">Terms of Service</a>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-caps text-label-caps text-on-surface">Customer</h4>
          <nav className="flex flex-col gap-2">
            <a className="font-body-md text-body-md text-on-tertiary-container hover:text-on-surface hover:underline decoration-secondary underline-offset-4 transition-opacity duration-500" href="#">Shipping</a>
            <a className="font-body-md text-body-md text-on-tertiary-container hover:text-on-surface hover:underline decoration-secondary underline-offset-4 transition-opacity duration-500" href="#">Returns</a>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-caps text-label-caps text-on-surface">Connect</h4>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-tertiary-container hover:text-secondary cursor-pointer" data-icon="language">language</span>
            <span className="material-symbols-outlined text-on-tertiary-container hover:text-secondary cursor-pointer" data-icon="mail">mail</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
