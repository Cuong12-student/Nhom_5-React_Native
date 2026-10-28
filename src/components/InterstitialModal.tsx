import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

interface InterstitialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InterstitialModal: React.FC<InterstitialModalProps> = ({
  visible,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setCountdown(5);
      setCanClose(false);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={canClose ? onClose : () => {}}
    >
      <View style={styles.container}>
        {/* Thanh tiêu đề trên cùng */}
        <View style={styles.topBar}>
          <View style={styles.adTagContainer}>
            <Text style={styles.adTag}>Quảng cáo</Text>
            <Text style={styles.sponsor}>• Được tài trợ</Text>
          </View>

          {canClose ? (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>Thưởng sau {countdown}s</Text>
            </View>
          )}
        </View>

        {/* Khung anh poster*/}
        <View style={styles.videoMockContainer}>
          <Image
            source={require("../../assets/images/shopee_sale.jpg")}
            style={styles.Poster}
            resizeMode="cover"
          />

          <View style={styles.videoOverlay}>
            <Text style={styles.liveTag}>🔥 SIÊU SALE HÔM NAY</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((5 - countdown) / 5) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Thẻ ứng dụng bên dưới */}
        <View style={styles.appCard}>
          <Image
            source={require("../../assets/images/shopee_logo.jpg")}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <View style={styles.appDetails}>
            <Text style={styles.appName} numberOfLines={1}>
              Shopee: Mua Sắm Online
            </Text>
            <Text style={styles.appDesc}>
              Mã giảm 50% • Freeship toàn quốc 0Đ
            </Text>
            <Text style={styles.rating}>⭐ 4.9 • 100 Tr+ lượt tải</Text>
          </View>
          <TouchableOpacity
            style={[styles.installBtn, { backgroundColor: "#EE4D2D" }]} // Màu cam đặc trưng Shopee
            onPress={onClose}
          >
            <Text style={styles.installText}>MUA NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1015",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 25,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  adTagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adTag: {
    backgroundColor: "#F9AB00",
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sponsor: {
    color: "#80868B",
    fontSize: 12,
    marginLeft: 6,
  },
  timerBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  timerText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  videoMockContainer: {
    flex: 1,
    marginVertical: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1E1F24",
    justifyContent: "flex-end",
  },
  Poster: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveTag: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1A73E8",
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1F24",
    padding: 14,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2C34",
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  appDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  appName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  appDesc: {
    color: "#9AA0A6",
    fontSize: 11,
    marginTop: 2,
  },
  rating: {
    color: "#FBBC04",
    fontSize: 11,
    marginTop: 3,
  },
  installBtn: {
    backgroundColor: "#1A73E8",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  installText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
