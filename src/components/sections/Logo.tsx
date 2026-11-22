// Same logo as the app (app.paytience.app): leaf mark, then "PAY" bold in ink and "tience.app" medium in green, set in Poppins.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-[7px] whitespace-nowrap leading-none">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static mark, no need for next/image */}
      <img src="/brand/logo-mark.png" alt="" aria-hidden width={28} height={30} className="h-[22px] w-auto sm:h-[28px] md:h-[30px]" />
      <span className="font-logo text-[15px] tracking-[-0.02em] sm:text-[18px] md:text-[20px]">
        <b className="font-bold text-[#141a16]">PAY</b>
        <span className="font-medium text-[#2f5640]">tience.app</span>
      </span>
    </span>
  );
}
