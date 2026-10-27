import React, { useRef, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button, Icon, Tap, Txt, s } from "../components/ui";
import { WalletArt } from "../components/wallet-art";
import { JourneyArt } from "../components/journey-art";
import { C } from "../constants/colors";

const slides = [
  {
    title: "Tiền của bạn.\nNgày tốt hơn.",
    body: "Hiểu từng khoản chi.\nChủ động từng ngày.",
    art: "wallet" as const,
  },
  {
    title: "Ghi chép nhỏ.\nChủ động lớn.",
    body: "Ghi lại từng giao dịch.\nSắp xếp theo cách của bạn.",
    art: "track" as const,
  },
  {
    title: "Hiểu rõ hơn.\nChi tiêu tốt hơn.",
    body: "Nhìn lại chi tiêu mỗi tháng.\nTạo thói quen cho ngày mai.",
    art: "insight" as const,
  },
];

export default function OnboardingScreen() {
  const dimensions = useWindowDimensions();
  const compact = dimensions.height < 760;
  const [width, setWidth] = useState(Math.min(dimensions.width, 600));
  const [page, setPage] = useState(0);
  const pager = useRef<React.ElementRef<typeof ScrollView>>(null);

  function goTo(index: number) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    setPage(next);
    pager.current?.scrollTo({ x: next * width, animated: true });
  }

  return (
    <LinearGradient colors={["#164A38", "#092E22"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          onLayout={(e) => {
            const nextWidth = e.nativeEvent.layout.width;
            if (Math.abs(nextWidth - width) > 1) {
              setWidth(nextWidth);
              setPage(0);
              pager.current?.scrollTo({ x: 0, animated: false });
            }
          }}
          style={{ flex: 1, width: "100%", maxWidth: 600, alignSelf: "center" }}
        >
          <View style={{ paddingHorizontal: 28, paddingTop: 16 }}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <View style={[s.row, { gap: 8 }]}>
                <Icon name="leaf" color={C.lime} size={21} />
                <Txt
                  weight="extra"
                  style={{ color: "#fff", fontSize: 21, letterSpacing: 4 }}
                >
                  mint.
                </Txt>
              </View>
              <Tap onPress={() => router.replace("/home")}>
                <Txt style={{ color: "#D1DDCD", fontSize: 12 }}>
                  Khám phá ngay ↗
                </Txt>
              </Tap>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: compact ? 10 : 20,
                marginBottom: 8,
              }}
            >
              {slides.map((slide, index) => (
                <Tap
                  key={slide.art}
                  onPress={() => goTo(index)}
                  style={{ width: 40, minHeight: 28, alignItems: "flex-start" }}
                >
                  <View
                    style={{
                      width: page === index ? 35 : 22,
                      height: 3,
                      borderRadius: 3,
                      backgroundColor: page === index ? C.lime : "#416450",
                    }}
                  />
                </Tap>
              ))}
              <Txt
                style={{
                  color: "#9FBB9E",
                  fontSize: 10,
                  marginLeft: "auto",
                  letterSpacing: 2,
                }}
              >
                {String(page + 1).padStart(2, "0")} / 03
              </Txt>
            </View>
          </View>

          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setPage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            style={{ flex: 1 }}
          >
            {slides.map((slide) => (
              <ScrollView
                key={slide.art}
                style={{ width }}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 28,
                  paddingTop: 4,
                }}
              >
                <View>
                  <Txt
                    weight="extra"
                    style={{
                      fontSize: compact ? 37 : 43,
                      color: "#fff",
                      letterSpacing: -2,
                      lineHeight: compact ? 47 : 54,
                    }}
                  >
                    {slide.title.split("\n")[0]}
                  </Txt>
                  <Txt
                    weight="extra"
                    style={{
                      fontSize: compact ? 37 : 43,
                      color: C.lime,
                      letterSpacing: -2,
                      lineHeight: compact ? 47 : 54,
                    }}
                  >
                    {slide.title.split("\n")[1]}
                  </Txt>
                  <Txt
                    style={{
                      marginTop: compact ? 12 : 17,
                      color: "#CDDCC9",
                      fontSize: 15,
                      lineHeight: compact ? 22 : 25,
                    }}
                  >
                    {slide.body}
                  </Txt>
                </View>
                <View
                  style={{
                    flex: 1,
                    minHeight: compact ? 180 : 220,
                    justifyContent: "center",
                    marginVertical: 6,
                  }}
                >
                  {slide.art === "wallet" ? (
                    <WalletArt compact={compact} />
                  ) : (
                    <JourneyArt compact={compact} variant={slide.art} />
                  )}
                </View>
              </ScrollView>
            ))}
          </ScrollView>

          <View
            style={{ paddingHorizontal: 28, paddingBottom: 20, paddingTop: 8 }}
          >
            <Button
              title={page === slides.length - 1 ? "Bắt đầu ngay" : "Tiếp theo"}
              light
              onPress={() =>
                page < slides.length - 1
                  ? goTo(page + 1)
                  : router.push("/login")
              }
            />
            <Txt
              style={{
                textAlign: "center",
                fontSize: 10,
                letterSpacing: 1.8,
                color: "#9AB5A1",
                marginTop: 17,
              }}
            >
              NHÓM 5 / EXPENSE MANAGEMENT
            </Txt>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
