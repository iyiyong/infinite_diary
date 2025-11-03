// ======================================================
// 🔑 1. react-calendar Value 타입 오류 해결을 위한 강제 선언
// 이 선언은 Value 타입을 Date 객체 등으로 인식하도록 TypeScript를 돕습니다.
// ======================================================
declare module 'react-calendar' {
  // Value 타입을 Date, Date 배열, 또는 null이 될 수 있도록 정의합니다.
  export type Value = Date | Date[] | null;
  
  // Calendar 컴포넌트 자체도 선언하여 import 오류를 방지합니다.
  export default function Calendar(props: any): JSX.Element;
}


// ======================================================
// 🔑 2. maath/random 타입 오류 해결을 위한 강제 선언
// maath 라이브러리의 inSphere 함수 사용 시 TypeScript 오류를 해결합니다.
// ======================================================
declare module 'maath/random/dist/maath-random.esm' {
  const exports: {
    // inSphere 함수가 Float32Array를 받고 Float32Array를 반환함을 정의합니다.
    inSphere: (array: Float32Array, options: { radius: number }) => Float32Array;
  };
  export default exports;
}


// ======================================================
// 🔑 3. Vite 환경 변수 타입 선언 (배포에 필수)
// TypeScript가 import.meta.env.VITE_API_URL을 인식하도록 합니다.
// ======================================================
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}