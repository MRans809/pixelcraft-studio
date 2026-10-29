package com.pixelcraft.persistence;

import com.pixelcraft.domain.Asset;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface AssetMapper {
    @Insert("""
            INSERT INTO assets(id, user_id, template_id, original_name, mime_type, size_bytes, storage_path)
            VALUES(#{id}, #{userId}, #{templateId}, #{originalName}, #{mimeType}, #{sizeBytes}, #{storagePath})
            """)
    void insert(Asset asset);

    @Select("""
            SELECT id, user_id, template_id, original_name, mime_type, size_bytes, storage_path, created_at
            FROM assets WHERE id = #{id}
            """)
    Optional<Asset> findById(@Param("id") String id);

    @Select("""
            <script>
            SELECT id, user_id, template_id, original_name, mime_type, size_bytes, storage_path, created_at
            FROM assets WHERE user_id = #{userId} AND id IN
            <foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach>
            </script>
            """)
    List<Asset> findOwnedByIds(@Param("userId") String userId, @Param("ids") List<String> ids);
}

