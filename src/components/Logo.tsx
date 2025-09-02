import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="https://i.postimg.cc/6qRNQd57/468963711-3994290450845859-6671631898219414239-n-removebg-preview.webp"
        alt="Copiermaster C&G Soluciones Digitales S.A Logo"
        width={144}
        height={144}
        className="h-28 w-auto"
      />
    </div>
  );
}
