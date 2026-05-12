import { Suspense, useCallback, useEffect, useState, type FC } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@mui/material";
import { LottieProps, Options } from "react-lottie";
const LazyLottieComponent = dynamic(() => import("react-lottie"), {
  ssr: false,
});
const Lottie = LazyLottieComponent as any as FC<LottieProps>;

export interface LazyLottieProps extends Omit<LottieProps, "options"> {
  path: string;
  options?: Partial<Omit<LottieProps["options"], "animationData">>;
}

const LazyLottie: FC<LazyLottieProps> = ({ ...props }) => {
  const [data, setData] = useState<Options>();

  const getData = useCallback(async () => {
    try {
      const response = await fetch(props.path);
      const data = await response.json();
      setData({
        loop: true,
        autoplay: true,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
        ...props.options,
        animationData: data,
      });
    } catch (error) {
      console.log("error", error);
    }
  }, [props.options, props.path]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.path]);

  if (!data)
    return (
      <Skeleton height={props.height} width={props.width} animation='wave' />
    );

  return (
    <Suspense fallback={<Skeleton height={props.height} width={props.width} />}>
      <Lottie {...props} options={data} />
    </Suspense>
  );
};

export default LazyLottie;
