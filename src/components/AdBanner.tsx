import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export function AdBanner() {
  return (
    <View style={styles.bannerContainer}>
      {/* 1. Nhãn Ad */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Ad</Text>
      </View>

      {/* 2. Ảnh sản phẩm / banner quảng cáo lấy từ Internet */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80",
        }}
        style={styles.bannerImage}
      />

      {/* 3. Nội dung quảng cáo */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          Thẻ tín dụng hoàn tiền 15%
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Đăng ký online duyệt ngay sau 5 phút
        </Text>
      </View>

      {/* 4. Nút bấm */}
      <TouchableOpacity style={styles.actionBtn}>
        <Text style={styles.actionText}>MỞ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 52,
    width: "100%",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
  },
  badge: {
    backgroundColor: "#F9AB00",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  bannerImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#202124",
  },
  subtitle: {
    fontSize: 10,
    color: "#5F6368",
  },
  actionBtn: {
    backgroundColor: "#00695C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 6,
  },
  actionText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
});
