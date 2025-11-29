// 기존에 있던 내용은 유지하고, 아래 내용을 추가하거나 덮어씌우세요.

// 3D 관련 라이브러리 타입 (maath 등)
declare module 'maath/random/dist/maath-random.esm';

// 🚨 이미지 파일 타입 정의 (이게 있어야 import가 됩니다!)
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}