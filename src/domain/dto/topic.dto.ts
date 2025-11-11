// src/domain/dto/topic.dto.ts
export interface CreateTopicDTO {
  name: string;
  subjectId: string;
}

export interface UpdateTopicDTO {
  name?: string;
  subjectId?: string;
}