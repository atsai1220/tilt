package build

import (
	"archive/tar"
	"bytes"
	"context"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	digest "github.com/opencontainers/go-digest"
)

type Mount struct {
	// TODO(dmiller) make this more generic
	Repo          LocalGithubRepo
	ContainerPath string
}

type Repo interface{}

type LocalGithubRepo struct {
	LocalPath string
}

type Cmd struct {
	argv []string
}

type localDockerBuilder struct {
	dcli *client.Client
}

func NewLocalDockerBuilder(cli *client.Client) *localDockerBuilder {
	return &localDockerBuilder{cli}
}

// NOTE(dmiller): not fully implemented yet
func (l *localDockerBuilder) BuildDocker(ctx context.Context, baseDockerfile string, mounts []Mount, cmds []Cmd, tag string) (digest.Digest, error) {
	baseTag, err := l.buildBaseWithMounts(ctx, baseDockerfile, tag, mounts)
	if err != nil {
		return "", err
	}

	// TODO(dmiller): steps

	return baseTag, nil
}

func (l *localDockerBuilder) buildBaseWithMounts(ctx context.Context, baseDockerfile string, tag string, mounts []Mount) (digest.Digest, error) {
	tar, err := tarContext(baseDockerfile, mounts)
	if err != nil {
		return "", err
	}
	// TODO(dmiller): remove this debugging code
	// tar2, err := tarFromDockerfileWithMounts(baseDockerfile, mounts)
	// if err != nil {
	// 	return "", err
	// }
	//buf := new(bytes.Buffer)
	//buf.ReadFrom(tar2)
	//err = ioutil.WriteFile("/tmp/debug.tar", buf.Bytes(), os.FileMode(0777))
	// if err != nil {
	// 	return "", err
	// }
	imageBuildResponse, err := l.dcli.ImageBuild(
		ctx,
		tar,
		types.ImageBuildOptions{
			Context:    tar,
			Dockerfile: "Dockerfile",
			Tags:       []string{tag},
			Remove:     shouldRemoveImage(),
		})

	if err != nil {
		return "", err
	}

	defer imageBuildResponse.Body.Close()
	output := &strings.Builder{}
	_, err = io.Copy(output, imageBuildResponse.Body)
	if err != nil {
		return "", err
	}

	return getDigestFromOutput(output.String())
}

// tarContext amends the dockerfile with appropriate ADD statements,
// and returns that new dockerfile + necessary files in a tar
func tarContext(df string, mounts []Mount) (*bytes.Reader, error) {
	buf := new(bytes.Buffer)
	tw := tar.NewWriter(buf)
	defer func() {
		err := tw.Close()
		if err != nil {
			log.Printf("Error closing tar writer: %s", err.Error())
		}
	}()

	// TODO(dmiller) is this a hack, or is it OK because we are filtering down the files available in the context below?
	newdf := fmt.Sprintf("%s\nADD . %s", df, "/src")

	tarHeader := &tar.Header{
		Name: "Dockerfile",
		Size: int64(len(newdf)),
	}
	err := tw.WriteHeader(tarHeader)
	if err != nil {
		return nil, err
	}
	_, err = tw.Write([]byte(newdf))
	if err != nil {
		return nil, err
	}

	for _, m := range mounts {
		// TODO(dmiller): doesn't seem like we _need_ to walk here, and in `tarFile`
		// but removing either causes the test to fail
		err := filepath.Walk(m.Repo.LocalPath, func(path string, info os.FileInfo, err error) error {
			err = tarFile(tw, path, m.ContainerPath)
			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			return nil, err
		}

	}

	contextTarReader := bytes.NewReader(buf.Bytes())

	return contextTarReader, nil
}

// tarFile writes the file at source into tarWriter. It does so
// recursively for directories.
func tarFile(tarWriter *tar.Writer, source, dest string) error {
	sourceInfo, err := os.Stat(source)
	if err != nil {
		return fmt.Errorf("%s: stat: %v", source, err)
	}

	var baseDir string
	if sourceInfo.IsDir() {
		baseDir = filepath.Base(source)
	}

	return filepath.Walk(source, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("error walking to %s: %v", path, err)
		}

		header, err := tar.FileInfoHeader(info, path)
		if err != nil {
			return fmt.Errorf("%s: making header: %v", path, err)
		}

		if baseDir != "" {
			header.Name = filepath.Join(baseDir, strings.TrimPrefix(path, source))
		}

		if header.Name == dest {
			// our new tar file is inside the directory being archived; skip it
			return nil
		}

		if info.IsDir() {
			header.Name += "/"
		}

		err = tarWriter.WriteHeader(header)
		if err != nil {
			return fmt.Errorf("%s: writing header: %v", path, err)
		}

		if info.IsDir() {
			return nil
		}

		if header.Typeflag == tar.TypeReg {
			file, err := os.Open(path)
			if err != nil {
				return fmt.Errorf("%s: open: %v", path, err)
			}
			defer file.Close()

			_, err = io.CopyN(tarWriter, file, info.Size())
			if err != nil && err != io.EOF {
				return fmt.Errorf("%s: copying contents: %v", path, err)
			}
		}
		return nil
	})
}

func getDigestFromOutput(output string) (digest.Digest, error) {
	re := regexp.MustCompile(`{"aux":{"ID":"([[:alnum:]:]+)"}}`)
	res := re.FindStringSubmatch(output)
	if len(res) != 2 {
		return "", fmt.Errorf("Digest not found in output: %s", output)
	}

	d, err := digest.Parse(res[1])
	if err != nil {
		return "", fmt.Errorf("getDigestFromOutput: %v", err)
	}

	return d, nil
}

func shouldRemoveImage() bool {
	if flag.Lookup("test.v") == nil {
		fmt.Println("normal run")
		return true
	}
	return false
}

var _ DockerBuilder = &localDockerBuilder{}
