import sys
from PIL import Image

def remove_magenta(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if pixel is close to magenta (R>200, G<50, B>200)
        # Using a slight tolerance for compression artifacts
        if item[0] > 200 and item[1] < 100 and item[2] > 200:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_magenta(sys.argv[1], sys.argv[2])
