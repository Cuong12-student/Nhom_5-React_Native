import React, { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export function JourneyArt({
  variant,
  compact = false,
  reducedMotion = false,
}: {
  variant: "track" | "insight";
  compact?: boolean;
  reducedMotion?: boolean;
}) {
  const [motion] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reducedMotion) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [motion, reducedMotion]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ alignItems: "center" }}
    >
      <Animated.View
        style={{
          width: compact ? 250 : 320,
          height: compact ? 210 : 265,
          transform: [
            {
              translateY: motion.interpolate({
                inputRange: [0, 1],
                outputRange: [4, -8],
              }),
            },
            {
              rotate: motion.interpolate({
                inputRange: [0, 1],
                outputRange: ["-3deg", "3deg"],
              }),
            },
          ],
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 360 300">
          <Defs>
            <LinearGradient id="journey-paper" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F4F6DF" />
              <Stop offset="1" stopColor="#C8D8B6" />
            </LinearGradient>
            <LinearGradient id="journey-green" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#427A5D" />
              <Stop offset="1" stopColor="#123E2D" />
            </LinearGradient>
          </Defs>

          <Circle
            cx="180"
            cy="145"
            r="125"
            fill="none"
            stroke="#B6CF9C"
            strokeWidth="0.6"
            opacity="0.24"
          />
          <Circle
            cx="180"
            cy="145"
            r="147"
            fill="none"
            stroke="#B6CF9C"
            strokeWidth="0.6"
            opacity="0.12"
          />
          <Ellipse
            cx="180"
            cy="272"
            rx="103"
            ry="12"
            fill="#062B1D"
            opacity="0.4"
          />

          {variant === "track" ? (
            <>
              <G transform="rotate(7 190 145)">
                <Rect
                  x="112"
                  y="36"
                  width="157"
                  height="215"
                  rx="22"
                  fill="#082D20"
                />
                <Rect
                  x="102"
                  y="29"
                  width="157"
                  height="215"
                  rx="22"
                  fill="url(#journey-green)"
                  stroke="#659577"
                />
                <Rect
                  x="115"
                  y="44"
                  width="131"
                  height="181"
                  rx="13"
                  fill="url(#journey-paper)"
                />
                <Circle cx="139" cy="71" r="11" fill="#2A654A" />
                <Path
                  d="m134 71 4 4 7-8"
                  stroke="#E6F0C8"
                  strokeWidth="2"
                  fill="none"
                />
                <Rect
                  x="157"
                  y="63"
                  width="64"
                  height="5"
                  rx="2"
                  fill="#53745C"
                />
                <Rect
                  x="157"
                  y="74"
                  width="41"
                  height="4"
                  rx="2"
                  fill="#9BAF8D"
                />
                {[101, 135, 169].map((y, i) => (
                  <G key={y}>
                    <Rect
                      x="128"
                      y={y}
                      width="22"
                      height="22"
                      rx="7"
                      fill={["#719873", "#B69E67", "#9AAA8E"][i]}
                    />
                    <Rect
                      x="161"
                      y={y + 3}
                      width="69"
                      height="4"
                      rx="2"
                      fill="#668568"
                    />
                    <Rect
                      x="161"
                      y={y + 13}
                      width="42"
                      height="4"
                      rx="2"
                      fill="#A2B495"
                    />
                  </G>
                ))}
                <Path
                  d="M130 206h101"
                  stroke="#9EB396"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              </G>
              <G transform="rotate(-9 84 186)">
                <Rect
                  x="37"
                  y="153"
                  width="108"
                  height="65"
                  rx="16"
                  fill="#174E36"
                  stroke="#6E9571"
                />
                <Circle cx="63" cy="181" r="12" fill="#D9E8B2" />
                <Path d="M58 181h10m-5-5v10" stroke="#28583C" strokeWidth="2" />
                <Rect
                  x="84"
                  y="172"
                  width="44"
                  height="5"
                  rx="2"
                  fill="#CFDFAF"
                />
                <Rect
                  x="84"
                  y="185"
                  width="30"
                  height="4"
                  rx="2"
                  fill="#7CA17B"
                />
              </G>
              <Circle cx="291" cy="100" r="25" fill="#C7DCA6" />
              <Path
                d="m281 100 7 7 13-15"
                fill="none"
                stroke="#285A3E"
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              <G transform="rotate(-5 180 145)">
                <Rect
                  x="59"
                  y="50"
                  width="242"
                  height="198"
                  rx="27"
                  fill="url(#journey-green)"
                  stroke="#679675"
                />
                <Rect
                  x="80"
                  y="71"
                  width="91"
                  height="5"
                  rx="2"
                  fill="#AAC294"
                />
                <Rect
                  x="80"
                  y="84"
                  width="55"
                  height="4"
                  rx="2"
                  fill="#6E9775"
                />
                <Circle
                  cx="170"
                  cy="157"
                  r="53"
                  fill="none"
                  stroke="#63876B"
                  strokeWidth="19"
                />
                <Circle
                  cx="170"
                  cy="157"
                  r="53"
                  fill="none"
                  stroke="#D7E6AD"
                  strokeWidth="19"
                  strokeDasharray="155 333"
                  rotation="-90"
                  origin="170,157"
                />
                <Circle
                  cx="170"
                  cy="157"
                  r="53"
                  fill="none"
                  stroke="#8DB783"
                  strokeWidth="19"
                  strokeDasharray="95 333"
                  strokeDashoffset="-165"
                  rotation="-90"
                  origin="170,157"
                />
                <Path
                  d="m155 161 11 10 21-25"
                  fill="none"
                  stroke="#E4ECCB"
                  strokeWidth="4"
                />
                <Rect
                  x="250"
                  y="170"
                  width="10"
                  height="45"
                  rx="4"
                  fill="#63876B"
                />
                <Rect
                  x="267"
                  y="143"
                  width="10"
                  height="72"
                  rx="4"
                  fill="#A5C291"
                />
              </G>
              <G transform="rotate(8 277 68)">
                <Rect
                  x="232"
                  y="31"
                  width="85"
                  height="64"
                  rx="17"
                  fill="url(#journey-paper)"
                />
                <Path
                  d="m250 75 15-14 11 5 22-20m-14 0h14v14"
                  fill="none"
                  stroke="#285B3D"
                  strokeWidth="3"
                />
              </G>
              <Circle cx="62" cy="226" r="22" fill="#D4E2B0" />
              <Path
                d="M54 230c14 0 18-9 18-15-12 0-21 6-18 15Zm0 0 11-9"
                fill="none"
                stroke="#315E40"
                strokeWidth="2"
              />
            </>
          )}

          <Circle cx="49" cy="82" r="4" fill="#D9E8B2" />
          <Path d="M307 220h13m-6.5-6.5v13" stroke="#CEE3A5" strokeWidth="2" />
        </Svg>
      </Animated.View>
    </View>
  );
}
