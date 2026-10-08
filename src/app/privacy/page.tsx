import Link from "next/link";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <h1 className="text-2xl font-semibold">आपके दस्तावेज़ का क्या होता है</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5">
        <li>फ़ोटो आपके फ़ोन पर छोटी की जाती है और सीधे पढ़ने के लिए भेजी जाती है।</li>
        <li>हम फ़ोटो, पढ़ा हुआ टेक्स्ट या जवाब कहीं सेव नहीं करते। न डेटाबेस, न फ़ाइल, न लॉग।</li>
        <li>जवाब देते ही सर्वर की मेमोरी से सब हट जाता है।</li>
        <li>न अकाउंट बनाना पड़ता है, न कोई ट्रैकर है।</li>
        <li>पढ़ने के लिए Google Vision और समझाने के लिए Claude (Anthropic) को टेक्स्ट भेजा जाता है। अपने प्रदाताओं की नीतियाँ देख लें।</li>
      </ul>
      <p className="mt-6 text-sm">Your document is processed in memory and discarded after the response. Nothing is stored.</p>
      <Link href="/" className="btn-primary mt-8">वापस जाएँ</Link>
    </main>
  );
}
