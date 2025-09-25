import { fireEvent, render, screen, within } from "@testing-library/react";
import LearningContentVideoLayout from "@/components/layouts/learning_content_video";

describe("LearningContentVideoLayout", () => {
    it("renders VideoPlayer with props", () => {
        render(
            <LearningContentVideoLayout
                videoUrl="test-video.mp4"
                title="Test Video Title"
                description="Test Video Desc"
                currentLessonIndex={1}
                totalLessons={4}
                supplementaryContent={
                    [
                        { label: "Blog Post", url: "blog.com/post" },
                        { label: "Official Documentation", url: "docs.com/get-started" }
                    ]
                }
                relatedVideos={[
                    {
                        id: 101,
                        title: "Einführung in React",
                        video_url: "https://example.com/videos/react-intro.mp4",
                    },
                    {
                        id: 102,
                        title: "State & Props erklärt",
                        video_url: "https://example.com/videos/state-props.mp4",
                    },
                    {
                        id: 103,
                        title: "Lifecycle Methoden",
                        video_url: "https://example.com/videos/lifecycle.mp4",
                    },
                ]}

            />
        );

        expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
        expect(screen.getByText("Test Video Title")).toBeInTheDocument();
        expect(screen.getByText("Test Video Desc")).toBeInTheDocument();
        expect(screen.getByText("Lektionen: 2 von 4")).toBeInTheDocument();

        const heading_resources = screen.getByRole("heading", { name: "Zusätzliche Ressourcen" })
        expect(heading_resources).toBeInTheDocument();

        const resourcesDiv = heading_resources.nextElementSibling as HTMLElement;
        expect(within(resourcesDiv).getByText("Blog Post")).toBeInTheDocument();
        expect(within(resourcesDiv).getByText("Official Documentation")).toBeInTheDocument();

        const heading_further_videos = screen.getByRole("heading", { name: "Weitere Lernvideos (3)" })
        expect(heading_further_videos).toBeInTheDocument();

        const videosDiv = heading_further_videos.nextElementSibling as HTMLElement;
        expect(within(videosDiv).getByText("Einführung in React")).toBeInTheDocument();
        expect(within(videosDiv).getByText("State & Props erklärt")).toBeInTheDocument();
        expect(within(videosDiv).getByText("Lifecycle Methoden")).toBeInTheDocument();
    });

    it("renders VideoPlayer without supplementaryContent and relatedVideos", () => {
        render(
            <LearningContentVideoLayout
                videoUrl="test-video.mp4"
                title="Test Video Title"
                description="Test Video Desc"
                currentLessonIndex={0}
                totalLessons={1}
            />
        );

        // VideoPlayer, Titel und Beschreibung prüfen
        expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
        expect(screen.getByText("Test Video Title")).toBeInTheDocument();
        expect(screen.getByText("Test Video Desc")).toBeInTheDocument();

        // Headings für Supplementary Content und Related Videos sollten nicht vorhanden sein
        expect(screen.queryByRole("heading", { name: "Zusätzliche Ressourcen" })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /Weitere Lernvideos/i })).not.toBeInTheDocument();
    });

    it("calls onSelectContent when a related video is clicked", () => {
        const mockSelect = vi.fn();
        const relatedVideos = [
            { id: 101, title: "Einführung in React", video_url: "react.mp4" },
            { id: 102, title: "State & Props erklärt", video_url: "state-props.mp4" },
        ];

        render(
            <LearningContentVideoLayout
                videoUrl="test-video.mp4"
                title="Test Video"
                description="Test Desc"
                currentLessonIndex={0}
                totalLessons={3}
                relatedVideos={relatedVideos}
                onSelectContent={mockSelect}
            />
        );

        // Klick auf ein Related Video
        const button = screen.getByText("State & Props erklärt");
        fireEvent.click(button);

        expect(mockSelect).toHaveBeenCalledTimes(1);
        expect(mockSelect).toHaveBeenCalledWith(102);
    });

})