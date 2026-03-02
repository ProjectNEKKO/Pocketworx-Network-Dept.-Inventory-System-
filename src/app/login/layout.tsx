export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="light" style={{ colorScheme: "light" }}>
            {children}
        </div>
    );
}
