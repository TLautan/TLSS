// frontend/app/pipeline/page.tsx
import { PipelineBoard } from '@/features/pipeline/components/pipeline-board';

export default function PipelinePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-3xl font-bold">営業パイプライン</h1>
        <p className="text-muted-foreground">取引をドラッグ アンド ドロップしてステータスを更新します。</p>
      </div>
      <div className="flex-grow overflow-hidden">
        <PipelineBoard />
      </div>
    </div>
  );
}