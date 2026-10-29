import unittest
from moviepy import AudioClip, ColorClip
from contain_variants import contain_clip


class ContainTests(unittest.TestCase):
    def test_wide_and_portrait_fit_without_crop(self):
        for source_size, target in [((160, 90), (90, 160)), ((90, 160), (160, 160))]:
            with ColorClip(source_size, color=(220, 20, 30), duration=1) as source:
                with contain_clip(source, target, background=(0, 0, 0)) as result:
                    self.assertEqual(tuple(result.size), target)
                    self.assertEqual(result.duration, 1)
                    center = result.get_frame(0)[target[1] // 2, target[0] // 2]
                    self.assertTrue((center == [220, 20, 30]).all())
                    corner = result.get_frame(0)[0, 0]
                    self.assertTrue((corner == [0, 0, 0]).all())
                self.assertEqual(source.get_frame(0).shape[:2], (source_size[1], source_size[0]))

    def test_audio_preserved(self):
        with AudioClip(lambda t: 0.25, duration=1, fps=44100) as audio:
            with ColorClip((160, 90), color=(10, 20, 30), duration=1).with_audio(audio) as source:
                with contain_clip(source, (160, 160)) as result:
                    self.assertIsNotNone(result.audio)
                    self.assertEqual(result.audio.get_frame(0.5), 0.25)


if __name__ == '__main__':
    unittest.main()
