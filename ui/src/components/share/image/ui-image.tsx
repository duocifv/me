import Image from "next/image";

type Props = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};
export const UiImage = ({ src, width = 100, height = 100 }: Props) => {
  // const dummySvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='${width}' height='${height}' fill='%23ccc'/%3E%3C/svg%3E`;

  // const state = useStore<{ currentSrc: string; loading: boolean }>({
  //   currentSrc: "",
  //   loading: true,
  // });

  // useVisibleTask$(() => {
  //   const img = new Image();
  //   img.src = src;
  //   img.onload = () => {
  //     state.currentSrc = src;
  //     state.loading = false;
  //   };
  //   img.onerror = () => {
  //     state.currentSrc = dummySvg;
  //     state.loading = false;
  //   };
  // });

  // if (state.loading) {
  //   return (
  //     <div
  //       style={{
  //         width: `${width}px`,
  //         height: `${height}px`,
  //         backgroundColor: "#eee",
  //       }}
  //     />
  //   );
  // }

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt="hero"
      style={{ width: "100%", height: " 100%" }}
      loading="lazy"
      fetchPriority="low"
    />
  );
};
