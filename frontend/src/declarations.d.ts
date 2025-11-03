// ======================================================
// 🔑 1. react-calendar Value 타입 오류 해결을 위한 강제 선언
// ======================================================
declare module 'react-calendar' {
  export type Value = Date | Date[] | null;
  export default function Calendar(props: any): JSX.Element;
}


// ======================================================
// 🔑 2. maath/random 타입 오류 해결을 위한 강제 선언
// ======================================================
// 🔑 오류 수정: 'maath' 라이브러리의 변경된 import 경로에 맞춰 선언 경로를 수정합니다.
declare module 'maath/random' {
  const inSphere: (array: Float32Array, options: { radius: number }) => Float32Array;
  export { inSphere };
}


// ======================================================
// 🔑 3. Vite 환경 변수 타입 선언 (배포에 필수)
// ======================================================
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}