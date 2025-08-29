def calculate_map_parameters_refined():
    """
    根据用户输入的相机中心、地图尺寸和边界厚度，
    计算画布偏移量和四周hitbox的参数。
    (采纳了用户建议的精确hitbox计算方式)
    """
    CANVAS_WIDTH = 1280
    CANVAS_HEIGHT = 720

    print("--- 游戏地图参数计算器 (精炼版) ---")
    print(f"本计算基于固定的画布（屏幕）分辨率：{CANVAS_WIDTH}x{CANVAS_HEIGHT}\n")

    try:
        # --- 获取用户输入 ---
        cam_x_str, cam_y_str = input("请输入相机中心的世界坐标 (格式: X,Y): ").split(',')
        camera_center_x = float(cam_x_str)
        camera_center_y = float(cam_y_str)

        map_width = float(input("请输入地图图片的总宽度 (例如: 768): "))
        map_height = float(input("请输入地图图片的总高度 (例如: 384): "))

        top_thickness = float(input("请输入顶部碰撞区的厚度 (天花板): "))
        bottom_thickness = float(input("请输入底部碰撞区的厚度 (地板): "))
        left_thickness = float(input("请输入左侧碰撞区的厚度 (左墙): "))
        right_thickness = float(input("请输入右侧碰撞区的厚度 (右墙): "))

        # --- 执行计算 ---

        # 1. 计算画布偏移量
        offset_x = (CANVAS_WIDTH / 2) - camera_center_x
        offset_y = (CANVAS_HEIGHT / 2) - camera_center_y

        # 2. 计算Hitbox参数
        # 格式: [x, y, width, height]
        hitbox_top = [0, 0, map_width, top_thickness]
        hitbox_bottom = [0, map_height - bottom_thickness, map_width, bottom_thickness]

        # *** 修正后的左右Hitbox计算 ***
        # Y坐标从顶部厚度之后开始
        side_y_start = top_thickness
        # 高度为地图总高度减去顶部和底部的厚度
        side_height = map_height - top_thickness - bottom_thickness

        hitbox_left = [0, side_y_start, left_thickness, side_height]
        hitbox_right = [map_width - right_thickness, side_y_start, right_thickness, side_height]

        # --- 显示结果 ---
        print("\n--- 计算结果 ---")
        print("\n[画布偏移量]")
        print(f"为了将相机中心对准屏幕中央，所有世界坐标在绘制时需要应用以下偏移：")
        print(f"  - X轴偏移量: {offset_x:.2f} 像素")
        print(f"  - Y轴偏移量: {offset_y:.2f} 像素")
        print(f"  (绘制坐标 = 世界坐标 + 偏移量)")


        print("\n[边界Hitbox参数]")
        print("以下参数可直接用于地图的.json文件中 (已优化，无重叠):")
        print(f"  - 天花板 (Top):    {hitbox_top}")
        print(f"  - 地板 (Bottom):  {hitbox_bottom}")
        print(f"  - 左墙 (Left):    {hitbox_left}")
        print(f"  - 右墙 (Right):   {hitbox_right}")
        print("------------------")


    except ValueError:
        print("\n[错误] 输入无效！请输入正确的数字和格式。")
    except Exception as e:
        print(f"\n[发生未知错误]: {e}")

if __name__ == "__main__":
    calculate_map_parameters_refined()