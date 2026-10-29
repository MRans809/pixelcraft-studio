package com.pixelcraft.persistence;

import com.pixelcraft.domain.CreationTask;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TaskMapper {
    @Insert("""
            INSERT INTO creation_tasks(id, user_id, template_id, status, stage, progress, failure_stage)
            VALUES(#{id}, #{userId}, #{templateId}, #{status}, #{stage}, #{progress}, #{failureStage})
            """)
    void insert(CreationTask task);

    @Insert("INSERT INTO task_assets(task_id, asset_id, slot_index) VALUES(#{taskId}, #{assetId}, #{slotIndex})")
    void attachAsset(@Param("taskId") String taskId, @Param("assetId") String assetId, @Param("slotIndex") int slotIndex);

    @Select("""
            SELECT t.id, t.user_id, t.template_id, p.title AS template_title,
                   t.status, t.stage, t.progress, t.failure_stage, t.failure_reason,
                   t.result_url, t.created_at, t.updated_at
            FROM creation_tasks t
            JOIN templates p ON p.id = t.template_id
            WHERE t.id = #{id} AND t.user_id = #{userId}
            """)
    Optional<CreationTask> findOwnedById(@Param("id") String id, @Param("userId") String userId);

    @Select("""
            SELECT t.id, t.user_id, t.template_id, p.title AS template_title,
                   t.status, t.stage, t.progress, t.failure_stage, t.failure_reason,
                   t.result_url, t.created_at, t.updated_at
            FROM creation_tasks t
            JOIN templates p ON p.id = t.template_id
            WHERE t.user_id = #{userId}
            ORDER BY t.created_at DESC
            """)
    List<CreationTask> findAllByUser(@Param("userId") String userId);

    @Update("""
            UPDATE creation_tasks SET status = #{status}, stage = #{stage}, progress = #{progress},
                failure_reason = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = #{id}
            """)
    void updateStage(@Param("id") String id, @Param("status") String status, @Param("stage") String stage, @Param("progress") int progress);

    @Update("""
            UPDATE creation_tasks SET status = 'FAILED', stage = #{stage}, failure_reason = #{reason},
                updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
            """)
    void markFailed(@Param("id") String id, @Param("stage") String stage, @Param("reason") String reason);

    @Update("""
            UPDATE creation_tasks SET status = 'SUCCEEDED', stage = 'COMPLETED', progress = 100,
                result_url = #{resultUrl}, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
            """)
    void markSucceeded(@Param("id") String id, @Param("resultUrl") String resultUrl);

    @Select("""
            SELECT a.id FROM assets a JOIN task_assets ta ON ta.asset_id = a.id
            WHERE ta.task_id = #{taskId} ORDER BY ta.slot_index LIMIT 1
            """)
    String findFirstAssetId(@Param("taskId") String taskId);
}
