import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#CCBDFC] dark:bg-[#6F5DA8] text-black dark:text-[#F8EBD0] font-poppins p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {/* Contact Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">CONTACT US</h3>
          <p className="text-sm">
            Join Solistic, as we revolutionise lending on Solana
          </p>
          <a
            href="mailto:info@solistic.finance"
            className="block mt-2 text-sm hover:underline"
          >
            info@solistic.finance
          </a>
        </div>

        {/* Useful Links Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">USEFUL LINKS</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://docs.solistic.finance/"
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                Litepaper
              </a>
            </li>
            <li>
              <a
                href="https://docs.solistic.finance/roadmap"
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                Roadmap
              </a>
            </li>
            <li>
              <a
                href="https://docs.solistic.finance/sls-token/sls-token-info"
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                Tokenomics
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">SOCIAL MEDIA</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://t.me/solisticfinance/"
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
            </li>
            <li>
              <a
                href="https://x.com/solisticfinance"
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                X (Twitter)
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="mt-8 text-center font-zilla-slab text-3xl sm:text-7xl">
        Solistic.finance
      </div>
    </footer>
  );
};

export default Footer;
