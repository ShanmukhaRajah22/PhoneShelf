import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "PhoneShelf",
  description: "A focused catalog of phones and their specifications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </body>
    </html>
  );
}
