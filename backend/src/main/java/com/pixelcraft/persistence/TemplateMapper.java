package com.pixelcraft.persistence;

import com.pixelcraft.domain.Template;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TemplateMapper {
    @Select("""
            <script>
            SELECT id, title, category, cover_url, description, required_image_count,
                   accepted_mime_types, max_file_size_bytes, created_at
            FROM templates
            <where><if test='category != null and category != ""'>category = #{category}</if></where>
            ORDER BY sort_order, created_at
            </script>
            """)
    List<Template> findAll(@Param("category") String category);

    @Select("""
            SELECT id, title, category, cover_url, description, required_image_count,
                   accepted_mime_types, max_file_size_bytes, created_at
            FROM templates WHERE id = #{id}
            """)
    Optional<Template> findById(@Param("id") String id);
}

